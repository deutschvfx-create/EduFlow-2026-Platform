module.exports = {
    apps: [{
        name: 'eduflow',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        cwd: './',
        instances: 1,
        exec_mode: 'fork',

        // Auto-restart configuration
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',

        // Environment
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
        },

        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Advanced features
        min_uptime: '10s',
        max_restarts: 10,
        restart_delay: 4000,
    }]
};
