
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Validação básica (exemplo)
        if (username.length < 3) {
            showMessage('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        try {
            const response = await fetch('/login', { // Endpoint de login no Flask
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message, 'success');
                // Redirecionar para a página de tarefas após o login bem-sucedido
                window.location.href = '/'; // Exemplo de redirecionamento
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Erro ao fazer requisição de login:', error);
            showMessage('Ocorreu um erro ao tentar fazer login. Tente novamente.', 'error');
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`; // Adiciona a classe 'success' ou 'error'
    }
});