import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import Modal from "react-modal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import dataJson from "./assets/data/activity.json";
import './App.css'

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });


const DATE_FMT = "dd-MM-yyyy";
const toKey = (d) => format(d, DATE_FMT);
const parseKey = (k) => parse(k, DATE_FMT, new Date());


function buildEvents(dictionary) {
  return Object.entries(dictionary).map(([k, list]) => {
    const total = list.reduce((sum, obj) => sum + Object.values(obj)[0], 0);
    const d = parseKey(k);
    return { title: `Total: ${total}`, start: d, end: d, allDay: true, resource: { key: k } };
  });
}

export default function App() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const events = useMemo(() => buildEvents(dataJson), []);
  const hasDataByKey = useMemo(() => new Set(Object.keys(dataJson)), []);

const dayPropGetter = (date) => {
  const key = toKey(date);
  const base = {};
  if (hasDataByKey.has(key)) {
    base.style = {
      background: "#fff7e6", 
    };
  }
  if (selectedKey && selectedKey === key) {
    base.style = { ...(base.style || {}), outline: "2px solid #fa8c16", outlineOffset: "-2px" };
  }
  return base;
};


  const onSelectSlot = ({ start }) => {
    const key = toKey(start);
    if (hasDataByKey.has(key)) {
      setSelectedKey(key);
      setIsOpen(true);
    } else {
      alert("No data found for the selected date.");
    }
  };

  const chartData =
    selectedKey && dataJson[selectedKey]
      ? dataJson[selectedKey].map((o) => {
          const [name, value] = Object.entries(o)[0];
          return { name, value };
        })
      : [];

  return (
    <div style={{ height: "100vh", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Attendance / Activity Calendar</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week", "day"]}
        selectable
        onSelectSlot={onSelectSlot}
        onView={() => setSelectedKey(null)}
        dayPropGetter={dayPropGetter}
        style={{ height: "90%" }}
      />

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        ariaHideApp={false}
        style={{
          content: { maxWidth: 720, margin: "40px auto", inset: 0, height: 420, padding: 20, borderRadius: 12 }
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Data for {selectedKey}</h2>
        <div style={{ width: "100%", overflowX: "auto" }}>
          <BarChart width={650} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" />
          </BarChart>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8 }}>
          Close
        </button>
      </Modal>
    </div>
  );
}
