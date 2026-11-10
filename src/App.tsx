import { useState, useEffect, useMemo } from 'react';
import { Chart } from './components/Chart';
import { cleanLoss } from './lib/dataCleaner';

const allRunIds = [
  'run-1', 'run-2', 'run-3', 'run-4', 'run-5',
  'run-6', 'run-7', 'run-8', 'run-9', 'run-10',
  'run-11', 'run-12', 'run-13', 'run-14', 'run-15',
  'run-nan', 'run-inf', 'run-messy', 'run-gaps', 'run-million'
];

function App() {
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для фильтра и сортировки
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  useEffect(() => {
    if (!selectedRun) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${import.meta.env.BASE_URL}data/${selectedRun}.json`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError('Не удалось загрузить данные');
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedRun]);

  // Фильтрация и сортировка списка
  const displayedRuns = useMemo(() => {
    let runs = allRunIds.filter(id => id.toLowerCase().includes(searchTerm.toLowerCase()));
    runs.sort((a, b) => {
      if (sortDesc) return b.localeCompare(a);
      return a.localeCompare(b);
    });
    return runs;
  }, [searchTerm, sortDesc]);

  const lossCheck = data ? cleanLoss(data.steps, data.loss) : null;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Training Runs Monitor</h1>

      {/* Панель фильтрации */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Поиск run..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: 1, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          onClick={() => setSortDesc(!sortDesc)}
          style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc' }}
        >
          {sortDesc ? 'Сортировка Я-А' : 'Сортировка А-Я'}
        </button>
      </div>

      {/* Список кнопок */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {displayedRuns.length === 0 && <p>Ничего не найдено (Empty state).</p>}
        {displayedRuns.map(id => (
          <button
            key={id}
            onClick={() => setSelectedRun(id)}
            style={{
              padding: '8px 16px',
              background: selectedRun === id ? '#333' : '#eee',
              color: selectedRun === id ? 'white' : 'black',
              border: '1px solid #ccc',
              cursor: 'pointer',
              borderRadius: 4
            }}
          >
            {id}
          </button>
        ))}
      </div>

      {loading && <p>Загрузка данных...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!selectedRun && !loading && <p>Выбери запуск из списка выше</p>}

      {data && !loading && (
        <div>
          <h2>Запуск: {selectedRun}</h2>

          {lossCheck?.hadNaN && (
            <div style={{ background: '#ffedd5', color: '#c2410c', padding: 10, marginBottom: 10, borderRadius: 4 }}>
              ⚠️ В данных есть NaN. Эти точки пропущены (линия разорвана).
            </div>
          )}
          {lossCheck?.hadInfinity && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: 10, marginBottom: 10, borderRadius: 4 }}>
              ⚠️ В данных есть Infinity. Эти точки пропущены.
            </div>
          )}

          <h3>Loss</h3>
          <Chart steps={data.steps} values={data.loss} label="Loss" />

          <h3>Learning Rate (lr)</h3>
          <Chart steps={data.steps} values={data.lr} label="LR" />

          <h3>Gradient Norm</h3>
          <Chart steps={data.steps} values={data.grad_norm} label="Grad Norm" />
        </div>
      )}
    </div>
  );
}

export default App;