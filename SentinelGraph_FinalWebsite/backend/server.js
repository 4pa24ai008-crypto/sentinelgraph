const express=require("express");
const cors=require("cors");
const Database=require("better-sqlite3");
const path=require("path");
const fs=require("fs");
const app=express();
const PORT=process.env.PORT||3000;
const ROOT=path.join(__dirname,"..");
const DATA=path.join(__dirname,"data");
fs.mkdirSync(DATA,{recursive:true});
const db=new Database(path.join(DATA,"sentinelgraph.db"));
db.pragma("journal_mode=WAL");
db.exec(`CREATE TABLE IF NOT EXISTS crime_records(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 case_id TEXT NOT NULL,date TEXT,crime_type TEXT,person TEXT,location TEXT,description TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_person ON crime_records(person);
CREATE INDEX IF NOT EXISTS idx_location ON crime_records(location);`);
app.use(cors());app.use(express.json({limit:"10mb"}));app.use(express.static(ROOT));
app.get("/api/health",(q,s)=>s.json({ok:true,database:"SQLite",records:db.prepare("SELECT COUNT(*) c FROM crime_records").get().c}));
app.get("/api/crime-records",(q,s)=>s.json(db.prepare("SELECT * FROM crime_records ORDER BY id DESC LIMIT 1000").all()));
app.post("/api/crime-records",(q,s)=>{const rows=q.body.records||[];const ins=db.prepare("INSERT INTO crime_records(case_id,date,crime_type,person,location,description) VALUES(?,?,?,?,?,?)");const tx=db.transaction(rs=>rs.forEach(r=>ins.run(String(r.case_id||""),String(r.date||""),String(r.crime_type||""),String(r.person||""),String(r.location||""),String(r.description||""))));try{tx(rows);s.json({ok:true,inserted:rows.length})}catch(e){s.status(400).json({error:e.message})}});
app.get("/api/entities",(q,s)=>s.json(db.prepare("SELECT person name,COUNT(*) cases,COUNT(DISTINCT location) locations FROM crime_records WHERE TRIM(person)<>'' GROUP BY person ORDER BY cases DESC").all()));
app.get("/api/location-analysis",(q,s)=>s.json(db.prepare("SELECT location,COUNT(*) cases,COUNT(DISTINCT person) entities FROM crime_records WHERE TRIM(location)<>'' GROUP BY location ORDER BY cases DESC").all()));
app.listen(PORT,()=>console.log("SentinelGraph backend running on http://localhost:"+PORT));