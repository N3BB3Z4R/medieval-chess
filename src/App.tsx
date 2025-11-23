import './App.css';
import './styles/main.css';
import Footer from './components/Footer/Footer';
import Messboard from './components/Messboard/Messboard';
import BoardCounter from './components/BoardCounter/BoardCounter';

function App() {
  return (
    <div id="app">
      <header>
        <h1>MESS - Medieval Chess</h1>
      </header>
      <BoardCounter />
      <Messboard />
      <Footer />
    </div>
  );
}

export default App;
