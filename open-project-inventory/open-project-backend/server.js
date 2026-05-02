const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors()); 
const PORT = process.env.PORT || 3000;

app.use(express.json());

let inventory = [
    {
        id: 1,
        name: "Arduino Kit",
        category: "Hardware",
        quantity: 5,
        status: "Available"
    }
];

let nextId = 2; 

app.get('/inventory', (req, res) => {
    res.json(inventory);
});

app.post('/inventory', (req, res) => {
    const incomingData = req.body;

    const newItem = {
        id: nextId,
        name: incomingData.name,
        category: incomingData.category,
        quantity: incomingData.quantity,
        status: incomingData.status
    };

    nextId++;

    inventory.push(newItem);

    res.status(201).json({ message: "item added successfully" });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

app.post('/chat', async (req, res) => {
    const userQuestion = req.body.question;

    const currentInventoryData = JSON.stringify(inventory);

    const systemPrompt = `
        You are the Open Project Inventory Assistant. Your job is to answer user questions about the current state of our inventory using ONLY the provided JSON context.
        
        Rules:
        1. Do not use outside knowledge.
        2. Define "low stock" as quantity < 5.
        
        Current Inventory Context:
        ${currentInventoryData}
    `;

    try {
        /*
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuestion }
            ]
        });
        
        res.json({ answer: aiResponse.choices[0].message.content });
        */
       
       // Mock Response:
       console.log("Constructed Prompt:\n", systemPrompt);
       console.log("User Asked:", userQuestion);
       
       res.json({ 
           answer: "Based on the context provided, I can see the inventory details. (This is a mocked LLM response)." 
       });

    } catch (error) {
        res.status(500).json({ error: "Failed to communicate with LLM" });
    }
});