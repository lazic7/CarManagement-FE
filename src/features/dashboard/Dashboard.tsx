import { Link } from "react-router";
import "../../App.css";

export const Dashboard = () => {
  return (
    <>
      <header>
        <div className="logo">AutoLedger</div>
        <nav>
          <span className="badge">Admin Panel</span>
          <Link to="/">Logout</Link>
        </nav>
      </header>
      <main>
        <div className="dashboard-grid">
          <div className="glass-card">
            <h2>Submit Mileage to Blockchain</h2>
            <div className="form-group">
              <label htmlFor="admin-vin">VIN Number</label>
              <input
                type="text"
                id="admin-vin"
                name="vin"
                placeholder="e.g. 1HGBH41JXMN109186"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-mileage">Mileage (km)</label>
              <input
                type="number"
                id="admin-mileage"
                name="mileage"
                placeholder="e.g. 45200"
                min="0"
              />
            </div>
            <button type="button" className="btn btn-primary">
              Save to Blockchain
            </button>

            <div className="metamask-box">
              <div className="metamask-icon" aria-hidden="true">
                🦊
              </div>
              <p>
                You will be asked to confirm this transaction in MetaMask. This
                will write the mileage record to the blockchain and cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
