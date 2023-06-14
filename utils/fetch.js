async function fetchWebsiteHits() {
    const pool = require ('./dbconfig')
    try {
      const client = await pool.connect();
  
      const query = 'SELECT * FROM website_hits';

      const result = await client.query(query);
  
      client.release();
  
      const rows = result.rows;
      console.log(rows); 
  
    } catch (error) {
      console.error('Error fetching website hits:', error);
    }
  }
  
  fetchWebsiteHits();