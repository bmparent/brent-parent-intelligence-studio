import argparse, pathlib, sys
def arguments(require_site=False):
    parser=argparse.ArgumentParser(description="Isolated native Windows WordPress acceptance; use a new task-owned external runtime directory")
    parser.add_argument('--runtime-root', required=True)
    parser.add_argument('--site-root', required=require_site)
    args, remaining=parser.parse_known_args()
    sys.argv=[sys.argv[0],*remaining]
    runtime=pathlib.Path(args.runtime_root).resolve()
    return runtime, pathlib.Path(args.site_root).resolve() if args.site_root else None
