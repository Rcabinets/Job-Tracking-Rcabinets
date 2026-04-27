import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const statuses = [
  "Lead",
  "Quoted",
  "Approved",
  "In Production",
  "Assembly",
  "Installed",
  "Completed",
];

const projectTypes = ["Reno", "Maintenance", "Cabinetry"];

function App() {

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    fromDate: "",
    toDate: "",
  });

  const emptyForm = {
    client: "",
    job: "",
    type: "Reno",
    quoteSent: false,
    quoteTotal: "",
    approved: false,
    status: "Lead",
    startDate: getToday(),
    dueDate: getDefaultDueDate(),
    notes: "",
    finalPayment: false,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem("jobs");
    if (saved) setJobs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const addJob = () => {
    if (!form.client || !form.job) return;
    setJobs([...jobs, { ...form, id: Date.now() }]);
    setForm({ ...emptyForm, startDate: getToday(), dueDate: getDefaultDueDate() });
  };

  const updateJob = (updated) => {
    setJobs(jobs.map(j => (j.id === updated.id ? updated : j)));
    setSelectedJob(updated);
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
    setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.job.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.client.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "All" || job.status === filters.status;

    const matchesFrom =
      !filters.fromDate || job.startDate >= filters.fromDate;

    const matchesTo =
      !filters.toDate || job.dueDate <= filters.toDate;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  if (selectedJob) {
    return (
      <div className="card">
        <div className="card-content">
          <button className="btn" onClick={() => setSelectedJob(null)}>← Back</button>
          <button className="btn" onClick={() => deleteJob(selectedJob.id)}>Delete</button>
        </div>

        <div className="p-4">
          <div className="grid gap-2">
            <input value={selectedJob.client} onChange={e => updateJob({ ...selectedJob, client: e.target.value })} className="form-field" />
            <input value={selectedJob.job} onChange={e => updateJob({ ...selectedJob, job: e.target.value })} className="form-field" />

            <select value={selectedJob.type} onChange={e => updateJob({ ...selectedJob, type: e.target.value })} className="border p-2 rounded-xl">
              {projectTypes.map(t => <option key={t}>{t}</option>)}
            </select>

            <label>Quote Sent</label>
            <input type="checkbox" checked={selectedJob.quoteSent} onChange={e => updateJob({ ...selectedJob, quoteSent: e.target.checked })} className="form-field"/>

            <input placeholder="Quote $" value={selectedJob.quoteTotal} onChange={e => updateJob({ ...selectedJob, quoteTotal: e.target.value })} className=" form-field" />

            <label>Approved / WO</label>
            <input type="checkbox" checked={selectedJob.approved} onChange={e => updateJob({ ...selectedJob, approved: e.target.checked })} className="form-field"/>

            <select value={selectedJob.status} onChange={e => updateJob({ ...selectedJob, status: e.target.value })} className="border">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>

            <label>Start Date</label>
            <input type="date" value={selectedJob.startDate} onChange={e => updateJob({ ...selectedJob, startDate: e.target.value })} className="form-field" />

            <label>Due Date</label>
            <input type="date" value={selectedJob.dueDate} onChange={e => updateJob({ ...selectedJob, dueDate: e.target.value })} className="form-field" />

            <textarea placeholder="Notes" value={selectedJob.notes} onChange={e => updateJob({ ...selectedJob, notes: e.target.value })} className="form-field" />

            <label>Final Payment</label>
            <input type="checkbox" checked={selectedJob.finalPayment} onChange={e => updateJob({ ...selectedJob, finalPayment: e.target.checked })} className="form-field"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="card">
        <div className="card-content">
          <input placeholder="Search job/client" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="form-field" />

          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border">
            <option>All</option>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>

          <div className="gap-2">
            <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} className="form-field" />
            <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} className="form-field" />
          </div>

          <input placeholder="Client Name" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="form-field" />
          <input placeholder="Job Name" value={form.job} onChange={e => setForm({ ...form, job: e.target.value })} className="form-field" />

          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border p-2 rounded-xl">
            {projectTypes.map(t => <option key={t}>{t}</option>)}
          </select>

          <button className="btn btn-primary" onClick={addJob}>Add Job</button>
        </div>
      </div>

      {filteredJobs.map(job => (
        <div key={job.id} className="card" onClick={() => setSelectedJob(job)}>
          <div className="card-content">
            <div>
              <div className="font-bold">{job.job}</div>
              <div className="text-sm">{job.client}</div>

              <div className="flex gap-2 flex-wrap">
                <span className={getStatusStyle(job.status)}>{job.status}</span>
                <span className={getPaymentStyle(job.finalPayment)}>
                  {job.finalPayment ? "Paid" : "Unpaid"}
                </span>
                <span className="text-xs">${job.quoteTotal || 0}</span>
              </div>
            </div>

            <div className="text-xs text-right">
              <div>Start: {job.startDate}</div>
              <div>Due: {job.dueDate}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getDefaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function getStatusStyle(status) {
  if (status === "Completed") {
    return "text-xs"; // no highlight
  }
  return "bg-green-200 text-green-800 px-2 py-1 rounded-lg text-xs";
}

function getPaymentStyle(paid) {
  if (paid) {
    return "text-xs"; // no highlight
  }
  return "bg-red-200 text-red-800 px-2 py-1 rounded-lg text-xs";
}

export default App
