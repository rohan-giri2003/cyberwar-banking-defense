const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Bank ke assets fetch karna
app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bank_infrastructure');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Attack Simulation Logic
app.post('/api/attack', async (req, res) => {
  const { assetId, attackerSkill } = req.body; 
  try {
    const assetResult = await pool.query('SELECT * FROM bank_infrastructure WHERE id = $1', [assetId]);
    const asset = assetResult.rows[0];

    if (!asset) return res.status(404).json({ error: "Asset not found" });

    const defenseStrength = asset.security_level / 100;
    const exposureFactor = asset.exposure / 100;
    const attackerAdvantage = attackerSkill / 100;
    
    // Compromise Probability Formula [cite: 35, 251-253]
    const compromiseProb = (exposureFactor + attackerAdvantage - defenseStrength) / 2;
    
    const isSuccess = Math.random() < compromiseProb;
    let impact = 0;

    if (isSuccess) {
      // Calculate Financial Impact  [cite: 44-48, 309-311]
      impact = parseFloat(asset.value_at_risk) * (1 + attackerAdvantage * 0.5);
      
      // Database mein record save karna  [cite: 52, 335-347]
      await pool.query(
        'INSERT INTO incidents (targeted_asset_id, attack_type, success, impact_cost) VALUES ($1, $2, $3, $4)',
        [asset.id, 'Ransomware', true, impact]
      );
    }

    res.json({
      success: isSuccess,
      impact: impact.toFixed(2),
      probability: (compromiseProb * 100).toFixed(2) + "%"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));