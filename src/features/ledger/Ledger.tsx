import { Link } from "react-router";
import "../../App.css";
1;
export const Ledger = () => {
  return (
    <>
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <Link to="/">Logout</Link>
        </nav>
      </header>
      <main>
        <div className="dashboard-grid">
          <div className="glass-card verification-card">
            <h2>Verify Vehicle Mileage</h2>
            <div className="form-group">
              <label htmlFor="vin">VIN Number</label>
              <input
                type="text"
                id="vin"
                name="vin"
                placeholder="e.g. 1HGBH41JXMN109186"
              />
            </div>
            <button type="button" className="btn btn-primary">
              Fetch Vehicle Data
            </button>

            <div className="results-section">
              <h3>Mileage history</h3>
              <div className="empty-state">
                <p>
                  Enter a VIN and click <strong>Fetch Vehicle Data</strong> to
                  see verification history.
                </p>
                <p>Results appear below as a timeline with blockchain proof.</p>
              </div>
              <ul className="timeline">
                <li className="timeline-item">
                  <div className="date">2024-01-15</div>
                  <div className="mileage">42,300 km</div>
                  <div className="hash">0x7f3a...9e2b</div>
                  <span className="status-badge">Verified on Blockchain</span>
                </li>
                <li className="timeline-item">
                  <div className="date">2023-06-08</div>
                  <div className="mileage">38,100 km</div>
                  <div className="hash">0x2c1d...4f8a</div>
                  <span className="status-badge">Verified on Blockchain</span>
                </li>
                <li className="timeline-item">
                  <div className="date">2022-11-22</div>
                  <div className="mileage">31,500 km</div>
                  <div className="hash">0x9e4b...1c7d</div>
                  <span className="status-badge">Verified on Blockchain</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
