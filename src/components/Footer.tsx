
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">GS</span>
              </div>
              <span className="font-heading font-bold text-xl">Green Sky</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Conectando aventureiros a pilotos de voo livre com propósito. 
              Sua aventura transforma o mundo, um voo de cada vez.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-greensky-600 transition-colors cursor-pointer">
                <span>📧</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-greensky-600 transition-colors cursor-pointer">
                <span>📱</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-greensky-600 transition-colors cursor-pointer">
                <span>📷</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/busca" className="hover:text-greensky-400 transition-colors">Encontrar Pilotos</a></li>
              <li><a href="/perfil" className="hover:text-greensky-400 transition-colors">Minhas Milhas</a></li>
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Banco de Sonhos</a></li>
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Para Pilotos</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Impacto</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Créditos de Carbono</a></li>
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Reflorestamento</a></li>
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Relatório de Impacto</a></li>
              <li><a href="#" className="hover:text-greensky-400 transition-colors">Certificações</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Green Sky. Todos os direitos reservados. Feito com 💚 para transformar aventuras em impacto.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
