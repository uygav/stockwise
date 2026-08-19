import express from 'express'

const app = express()
const PORT = process.env.PORT || 4000

app.get('/api/testing', (req,res) => {
    res.json({status:'ok'})
})

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`)
})