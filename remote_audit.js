const { spawn } = require('child_process');

console.log('Starting remote audit process...');

const child = spawn('ssh', [
    '-tt',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'PreferredAuthentications=password',
    'root@46.224.154.154',
    "echo '---FILESYSTEM---'; ls -d /root/EduFlow-2026-Platform; echo '---PM2 STATUS---'; pm2 status; echo '---LISTENING PORTS---'; netstat -tulpn | grep LISTEN; echo '---NGINX CONFIGS---'; ls /etc/nginx/sites-enabled; echo '---GIT STATUS---'; cd /root/EduFlow-2026-Platform && git log -1 --format='%h - %ad - %s' && git branch --show-current; echo '---UPTIME---'; uptime"
]);

let passwordSent = false;

const handleOutput = (data) => {
    const output = data.toString();
    console.log(`[STDOUT/STDERR]: ${JSON.stringify(output)}`);
    process.stdout.write(output);

    // Send password if we see anything resembling a prompt
    if (!passwordSent && (output.toLowerCase().includes('password') || output.includes(':'))) {
        console.log('\n[Automation] Match detected. Sending password...');
        child.stdin.write('123456789\n');
        passwordSent = true;
    }
};

child.stdout.on('data', handleOutput);
child.stderr.on('data', handleOutput);

child.on('close', (code) => {
    console.log(`\n[Automation] Audit script exited with code ${code}`);
    process.exit(code);
});

// Triple-redundant blind send
[2000, 5000, 10000].forEach(delay => {
    setTimeout(() => {
        if (!passwordSent) {
            console.log(`\n[Automation] Timer (${delay}ms) fallback: Sending password blindly...`);
            child.stdin.write('123456789\n');
            passwordSent = true;
        }
    }, delay);
});

// Timeout fail-safe
setTimeout(() => {
    console.log('\n[Automation] Global timeout reached.');
    child.kill();
    process.exit(1);
}, 60000);
