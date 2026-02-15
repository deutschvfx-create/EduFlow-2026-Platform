const { spawn } = require('child_process');

console.log('Starting refined deployment automation...');

const child = spawn('ssh', [
    '-tt',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'PreferredAuthentications=password',
    'root@46.224.154.154',
    'cd /root/EduFlow-2026-Platform && git pull origin main && npm run build && pm2 restart all'
]);

let passwordSent = false;

const handleOutput = (data) => {
    const output = data.toString();
    process.stdout.write(output);

    if (!passwordSent && output.toLowerCase().includes('password:')) {
        console.log('\n[Automation] Prompt detected. Sending password...');
        child.stdin.write('123456789\n');
        passwordSent = true;
    }
};

child.stdout.on('data', handleOutput);
child.stderr.on('data', handleOutput);

child.on('close', (code) => {
    console.log(`\n[Automation] Deployment script exited with code ${code}`);
    process.exit(code);
});

// Timeout fail-safe
setTimeout(() => {
    if (!passwordSent) {
        console.log('\n[Automation] Timeout: Password prompt not found.');
        child.kill();
        process.exit(1);
    }
}, 30000);
