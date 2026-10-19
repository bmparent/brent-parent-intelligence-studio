import ctypes, json, pathlib, sys, time
from ctypes import wintypes

from runtime_args import arguments
root, _ = arguments()
pid=int(sys.argv[1]); inspect='--inspect' in sys.argv
runtime=json.loads((root/'runtime-receipt.json').read_text())
assert pid in [site['php_pid'] for site in runtime['sites']], 'PID not in task-owned receipt'
k=ctypes.WinDLL('kernel32',use_last_error=True)
k.OpenProcess.argtypes=[wintypes.DWORD,wintypes.BOOL,wintypes.DWORD];k.OpenProcess.restype=wintypes.HANDLE
k.QueryFullProcessImageNameW.argtypes=[wintypes.HANDLE,wintypes.DWORD,wintypes.LPWSTR,ctypes.POINTER(wintypes.DWORD)]
k.CloseHandle.argtypes=[wintypes.HANDLE]
handle=k.OpenProcess(0x1000,False,pid); assert handle, 'Cannot inspect owned PHP PID'
buffer=ctypes.create_unicode_buffer(32768);size=wintypes.DWORD(len(buffer));assert k.QueryFullProcessImageNameW(handle,0,buffer,ctypes.byref(size)); k.CloseHandle(handle)
assert pathlib.Path(buffer.value).resolve()==(root/'php81'/'php.exe').resolve(), 'PID executable changed'
k.FreeConsole()
attached=bool(k.AttachConsole(pid))
if not attached:
    print(json.dumps({'pid':pid,'graceful_console_available':False,'win32_error':ctypes.get_last_error()}),flush=True);sys.exit(2)
ids=(wintypes.DWORD*16)();count=k.GetConsoleProcessList(ids,16);actual=set(ids[:count]);own=k.GetCurrentProcessId()
safe=count<=16 and actual.issubset({pid,own}) and pid in actual
if inspect:
    k.FreeConsole(); print(json.dumps({'pid':pid,'graceful_console_available':safe,'console_process_count':count}),flush=True);sys.exit(0 if safe else 3)
assert safe,'Console contains processes outside this bounded stop operation'
k.SetConsoleCtrlHandler(None,True)
sent=bool(k.GenerateConsoleCtrlEvent(0,0))
time.sleep(1)
k.FreeConsole()
print(json.dumps({'pid':pid,'graceful_ctrl_c_sent':sent,'console_process_count':count}),flush=True)
