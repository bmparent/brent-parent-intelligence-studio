import datetime, json, pathlib, socket, subprocess, sys, time, urllib.parse
from runtime_args import arguments

ROOT, _ = arguments(); HELPERS=pathlib.Path(__file__).resolve().parent
PRIVATE=ROOT/'private';ENV=dict(__import__('os').environ,TEMP=str(ROOT/'tmp'),TMP=str(ROOT/'tmp'))
action=sys.argv[1] if len(sys.argv)>1 else ''; assert action in ['start','stop'],'Specify start or stop'
runtime_file=ROOT/'runtime-receipt.json';runtime=json.loads(runtime_file.read_text());ports=[runtime['mariadb_port'],*[urllib.parse.urlparse(s['url']).port for s in runtime['sites']]]
def closed(port):
    with socket.socket() as s:s.bind(('127.0.0.1',port))
def wait_closed(port):
    end=time.monotonic()+20
    while time.monotonic()<end:
        try:closed(port);return
        except OSError:time.sleep(.25)
    raise RuntimeError('Owned localhost listener remains open')
def wait_open(port):
    end=time.monotonic()+30
    while time.monotonic()<end:
        try:
            with socket.create_connection(('127.0.0.1',port),timeout=1):return
        except OSError:time.sleep(.25)
    raise RuntimeError('Owned localhost listener unavailable')
def start(exe,args,name):
    quote=lambda value:"'"+str(value).replace("'","''")+"'"
    argline=' '.join('"'+str(a).replace('"','\\"')+'"' for a in args)
    pidfile=PRIVATE/(name+'-managed.pid')
    command='$p=Start-Process -FilePath '+quote(exe)+' -ArgumentList '+quote(argline)+' -WindowStyle Hidden -PassThru -RedirectStandardOutput '+quote(PRIVATE/(name+'-managed-stdout.log'))+' -RedirectStandardError '+quote(PRIVATE/(name+'-managed-stderr.log'))+'; $p.Id | Set-Content -LiteralPath '+quote(pidfile)
    p=subprocess.Popen(['powershell.exe','-NoProfile','-Command',command],stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV)
    assert p.wait(timeout=30)==0;return int(pidfile.read_text(encoding='utf-8-sig').strip())
receipt={'action':action,'timestamp_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Only PID/executable-verified task-owned PHP and authenticated task-owned MariaDB; no deletion or service operations','sites':[]}
if action=='stop':
    assert runtime['status']!='stopped','Runtime is already stopped'
    for site in runtime['sites']:
        result=subprocess.run([sys.executable,str(HELPERS/'stop-php-gracefully.py'),'--runtime-root',str(ROOT),str(site['php_pid'])],capture_output=True,timeout=30,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV)
        assert result.returncode==0,'Safe PHP console stop failed'
        stop=json.loads(result.stdout);assert stop['graceful_ctrl_c_sent'];wait_closed(urllib.parse.urlparse(site['url']).port);receipt['sites'].append({'product':site['product'],'pid':site['php_pid'],'graceful_ctrl_c_sent':True})
    admin=ROOT/'mariadb/mariadb-10.11.19-winx64/bin/mariadb-admin.exe'
    result=subprocess.run([str(admin),'--defaults-extra-file='+str(PRIVATE/'root-client.ini'),'shutdown'],capture_output=True,timeout=30,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV);assert result.returncode==0,'MariaDB authenticated shutdown failed';wait_closed(runtime['mariadb_port'])
    receipt.update({'status':'stopped','mariadb_pid':runtime['mariadb_pid'],'mariadb_authenticated_shutdown_exit_code':0,'forced_termination':False,'all_task_ports_closed':True,'all_files_databases_credentials_exports_preserved':True})
    runtime['status']='stopped';runtime['stopped_at_utc']=receipt['timestamp_utc']
else:
    assert runtime['status']=='stopped','Refusing duplicate start of a recorded running runtime'
    for port in ports:closed(port)
    runtime['mariadb_pid']=start(ROOT/'mariadb/mariadb-10.11.19-winx64/bin/mariadbd.exe',['--defaults-file='+str(PRIVATE/'mariadb.ini'),'--console'],'mariadb');wait_open(runtime['mariadb_port'])
    for site in runtime['sites']:
        port=urllib.parse.urlparse(site['url']).port
        site['php_pid']=start(ROOT/'php81/php.exe',['-c',str(ROOT/'php.ini'),'-S','127.0.0.1:'+str(port),'-t',site['document_root'],str(ROOT/'router.php')],'php-'+site['product']);wait_open(port);receipt['sites'].append({'product':site['product'],'pid':site['php_pid'],'url':site['url']})
    runtime['status']='running';runtime['started_at_utc']=receipt['timestamp_utc'];receipt.update({'status':'running','mariadb_pid':runtime['mariadb_pid'],'all_listeners_localhost_only':True})
runtime_file.write_text(json.dumps(runtime,indent=2),encoding='utf-8')
(ROOT/('last-'+action+'-receipt.json')).write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt),flush=True)
