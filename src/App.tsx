import './App.css';
import Messboard from './components/Messboard/Messboard';

function App() {
  return (
    <div id="app">
      <header>
        <h1>MESS - Medieval Chess</h1>
      </header>
      <div className="boardDecoration">
        <div className="profileOpponent">
          <img src="https://pbs.twimg.com/profile_images/1362482512702889984/DUddweNT.jpg" alt="" />
          Nebe Oponente
          <h4>NATIONAL CHAMP</h4>
          <div>1.156 Puntos</div>
        </div>
        <Messboard/>
        <div className="profileOur">
          <img src="https://vistalegre2.podemos.info/wp-content/uploads/2017/02/Pepe_Viyuela.jpg" alt="" />
          Pepe Nosotros
          <h4>GRAN MAESTRO</h4>
          <div>1.430 Puntos</div>
        </div>
      </div>
      <footer><div>Made with ❤️ by <a href="https://www.nebeworks.com">Óscar 'Nebe' Abad</a></div></footer>
    </div>
  );
}

export default App;
