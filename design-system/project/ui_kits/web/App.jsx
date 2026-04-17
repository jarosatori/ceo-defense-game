/* global React, ReactDOM, LandingScreen, PlanningScreen, ResultsScreen */
const { useState } = React;

function App() {
  const [screen, setScreen] = useState('landing');
  const [state, setState] = useState({
    wave: 1, budget: 80, countdown: 25,
    revenue: 23, profit: -7, monthlyCosts: 30,
    team: [{ id:'va-1', role:'va', level:'junior', label:'Virtuálna asistentka', monthly:30, cat:'gen' }],
    missed: { mkt: 55, fin: 20, ops: 15, gen: 10 },
    focus: 'product'
  });

  function hire(r) {
    if (state.budget < r.cost) return;
    setState(s => ({
      ...s,
      budget: s.budget - r.cost,
      monthlyCosts: s.monthlyCosts + r.monthly,
      team: [...s.team, {
        id: `${r.role}-${Date.now()}`,
        role: r.role, level:'junior',
        label: r.label, monthly: r.monthly, cat: r.cat
      }]
    }));
  }

  function fire(id) {
    setState(s => {
      const m = s.team.find(x => x.id === id);
      if (!m) return s;
      return {
        ...s,
        monthlyCosts: s.monthlyCosts - m.monthly,
        team: s.team.filter(x => x.id !== id)
      };
    });
  }

  const setFocus = (focus) => setState(s => ({ ...s, focus }));

  const goPlanning = () => setScreen('planning');
  const goResults = () => setScreen('results');
  const replay = () => setScreen('landing');

  if (screen === 'landing') return <LandingScreen onStart={goPlanning}/>;
  if (screen === 'planning') return (
    <PlanningScreen
      state={state}
      onContinue={goResults}
      onHire={hire}
      onFire={fire}
      onSetFocus={setFocus}
    />
  );
  return <ResultsScreen
    results={{
      profile:'micromanager', waves:4, score:1247,
      revenue:127, profit:42, team: state.team
    }}
    onReplay={replay}
  />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
