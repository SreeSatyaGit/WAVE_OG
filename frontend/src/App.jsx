import Home from "./pages/Home";

function App({ authInfo }) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "24px" }}>
      <Home authInfo={authInfo} />
    </div>
  );
}

export default App;
