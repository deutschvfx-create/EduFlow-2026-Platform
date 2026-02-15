import subprocess
import time
import sys

def run_deploy():
    print("Starting Antigravity Deployment Automation...")
    
    # The command to run on the server
    remote_cmd = "cd /root/EduFlow-2026-Platform && git pull origin main && npm run build && pm2 restart all"
    
    # SSH command
    ssh_cmd = [
        "ssh", 
        "-tt",
        "-o", "StrictHostKeyChecking=no",
        "-o", "PreferredAuthentications=password",
        "root@46.224.154.154",
        remote_cmd
    ]
    
    print(f"Executing: {' '.join(ssh_cmd)}")
    
    # Start the process
    process = subprocess.Popen(
        ssh_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    password_sent = False
    
    # Monitor output
    while True:
        line = process.stdout.readline()
        if not line:
            break
        
        print(line, end="")
        
        if "password:" in line.lower() and not password_sent:
            print("\n[Antigravity] Prompt detected. Sending password...")
            process.stdin.write("123456789\n")
            process.stdin.flush()
            password_sent = True
            
    process.wait()
    print(f"\n[Antigravity] Process finished with code {process.returncode}")

if __name__ == "__main__":
    run_deploy()
