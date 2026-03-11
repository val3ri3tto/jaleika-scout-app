import './BallRating.css'

export default function BallRating({ value = 0, onChange }) {
  return (
    <div className="ball-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          className={`ball-rating__ball ${n <= value ? 'active' : ''}`}
          onClick={() => onChange(n === value ? 0 : n)}
          type="button"
          aria-label={`Voto ${n}`}
        >
          &#9917;
        </button>
      ))}
    </div>
  )
}
