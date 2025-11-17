import Alpine from 'alpinejs';

// Terminal component function
window.terminal = function() {
    return {
        currentCommand: '',
        history: [],

        init() {
            // Auto-focus the input
            this.$refs.input.focus();

            // Refocus on click anywhere
            document.addEventListener('click', () => {
                this.$refs.input.focus();
            });
        },

        executeCommand() {
            const cmd = this.currentCommand.trim().toLowerCase();
            let output = '';

            if (cmd === '') {
                return;
            }

            switch(cmd) {
                case 'help':
                    output = `Available commands:<br>
                        &nbsp;&nbsp;help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Show this help message<br>
                        &nbsp;&nbsp;clear&nbsp;&nbsp;&nbsp;&nbsp;- Clear the terminal<br>
                        &nbsp;&nbsp;about&nbsp;&nbsp;&nbsp;&nbsp;- About this page<br>
                        &nbsp;&nbsp;contact&nbsp;&nbsp;- Contact information<br>
                        &nbsp;&nbsp;date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Show current date and time`;
                    break;
                case 'clear':
                    this.history = [];
                    this.currentCommand = '';
                    return;
                case 'about':
                    output = 'This page is currently under construction.<br>Check back soon for updates!';
                    break;
                case 'contact':
                    output = 'Coming soon...';
                    break;
                case 'date':
                    output = new Date().toString();
                    break;
                default:
                    output = `Command not found: ${this.currentCommand}<br>Type 'help' for available commands.`;
            }

            this.history.push({
                command: this.currentCommand,
                output: output
            });

            this.currentCommand = '';

            // Scroll to bottom
            this.$nextTick(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
        }
    }
};

// Make Alpine available globally
window.Alpine = Alpine;
Alpine.start();
