import ctypes, datetime, json, pathlib, socket, subprocess, time
from ctypes import wintypes
from runtime_args import arguments
ROOT, _ = arguments();PRIVATE=ROOT/'private';ENV=dict(__import__('os').environ,TEMP=str(ROOT/'tmp'),TMP=str(ROOT/'tmp'))
runtime_path=ROOT/'runtime-receipt.json';runtime=json.loads(runtime_path.read_text());initial=json.loads(json.dumps(runtime))
assert not (ROOT/'restart-receipt.json').exists(),'Refusing repeated unjournaled restart'
(ROOT/'initial-runtime-receipt.json').write_text(json.dumps(initial,indent=2),encoding='utf-8')
k=ctypes.WinDLL('kernel32',use_last_error=True)
k.OpenProcess.argtypes=[wintypes.DWORD,wintypes.BOOL,wintypes.DWORD];k.OpenProcess.restype=wintypes.HANDLE
k.WaitForSingleObject.argtypes=[wintypes.HANDLE,wintypes.DWORD];k.CloseHandle.argtypes=[wintypes.HANDLE]
def wait_exit(pid):
    handle=k.OpenProcess(0x100000,False,pid)
    if not handle:return
    result=k.WaitForSingleObject(handle,20000);k.CloseHandle(handle);assert result==0,'Owned process did not exit normally'
def closed(port):
    with socket.socket() as s:s.bind(('127.0.0.1',port))
def wait_port(port):
    end=time.monotonic()+30
    while time.monotonic()<end:
        try:
            with socket.create_connection(('127.0.0.1',port),timeout=1):return
        except OSError:time.sleep(.25)
    raise RuntimeError('Restart listener unavailable')
def start(exe,args,name):
    quote=lambda v:"'"+str(v).replace("'","''")+"'"
    argline=' '.join('"'+str(a).replace('"','\\"')+'"' for a in args)
    pidfile=PRIVATE/(name+'-restart-launcher.pid')
    command='$p=Start-Process -FilePath '+quote(exe)+' -ArgumentList '+quote(argline)+' -WindowStyle Hidden -PassThru -RedirectStandardOutput '+quote(PRIVATE/(name+'-restart-stdout.log'))+' -RedirectStandardError '+quote(PRIVATE/(name+'-restart-stderr.log'))+'; $p.Id | Set-Content -LiteralPath '+quote(pidfile)
    p=subprocess.Popen(['powershell.exe','-NoProfile','-Command',command],creationflags=subprocess.CREATE_NO_WINDOW,env=ENV,stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    assert p.wait(timeout=30)==0
    return int(pidfile.read_text(encoding='utf-8-sig').strip())
php_stops=[]
for site in runtime['sites']:
    r=subprocess.run(['python',str(ROOT/'stop-php-gracefully.py'),'--runtime-root',str(ROOT),str(site['php_pid'])],creationflags=subprocess.CREATE_NO_WINDOW,env=ENV,capture_output=True,timeout=30)
    assert r.returncode==0,'Safe graceful PHP stop failed'
    stop=json.loads(r.stdout);assert stop['graceful_ctrl_c_sent'];wait_exit(site['php_pid']);closed(__import__('urllib.parse',fromlist=['urlparse']).urlparse(site['url']).port);php_stops.append(stop)
maria=ROOT/'mariadb/mariadb-10.11.19-winx64/bin'
dump_path=PRIVATE/'four-native-sites-before-restart.sql'
with dump_path.open('xb') as output:
    dump=subprocess.run([str(maria/'mariadb-dump.exe'),'--defaults-extra-file='+str(PRIVATE/'root-client.ini'),'--single-transaction','--databases',*[site['database'] for site in runtime['sites']]],stdout=output,stderr=subprocess.PIPE,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV,timeout=60)
assert dump.returncode==0,'Private SQL export failed'
shutdown=subprocess.run([str(maria/'mariadb-admin.exe'),'--defaults-extra-file='+str(PRIVATE/'root-client.ini'),'shutdown'],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW,env=ENV,timeout=30)
assert shutdown.returncode==0,'Authenticated MariaDB graceful shutdown failed'
wait_exit(runtime['mariadb_pid']);closed(runtime['mariadb_port'])
runtime['mariadb_pid']=start(maria/'mariadbd.exe',['--defaults-file='+str(PRIVATE/'mariadb.ini'),'--console'],'mariadb');wait_port(runtime['mariadb_port'])
for site in runtime['sites']:
    port=__import__('urllib.parse',fromlist=['urlparse']).urlparse(site['url']).port
    site['php_pid']=start(ROOT/'php81/php.exe',['-c',str(ROOT/'php.ini'),'-S','127.0.0.1:'+str(port),'-t',site['document_root'],str(ROOT/'router.php')],'php-'+site['product']);wait_port(port)
runtime['timestamp_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat();runtime['status']='restarted_ready_for_persistence_verification'
runtime_path.write_text(json.dumps(runtime,indent=2),encoding='utf-8')
receipt={'timestamp_utc':runtime['timestamp_utc'],'status':'graceful_owned_restart_complete','php_stop_method':'Windows Ctrl-C event after executable/PID/console membership verification; each console held only target PHP and stop helper','php_stops':php_stops,'mariadb_stop_method':'Authenticated mariadb-admin shutdown through private defaults file','mariadb_shutdown_exit_code':shutdown.returncode,'old_mariadb_pid':initial['mariadb_pid'],'new_mariadb_pid':runtime['mariadb_pid'],'sites':[{'product':s['product'],'old_php_pid':initial['sites'][i]['php_pid'],'new_php_pid':s['php_pid'],'url':s['url']} for i,s in enumerate(runtime['sites'])],'private_sql_export':{'path':str(dump_path),'bytes':dump_path.stat().st_size,'sha256':__import__('hashlib').file_digest(dump_path.open('rb'),'sha256').hexdigest(),'published':False},'data_directory_reused':True,'databases_deleted_or_recreated':False,'windows_services_created':False,'force_termination_used':False,'persistence_verification_pending':True}
(ROOT/'restart-receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8');print(json.dumps(receipt),flush=True)
