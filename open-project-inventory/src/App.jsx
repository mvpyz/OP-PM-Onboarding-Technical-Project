import React, { useState, useEffect } from "react";

const auditLogs = [
  { scene_id: "shelf_01", item: "Raspberry Pi", event_type: "DISCREPANCY", confidence: 0.92, recommended_action: "Auto-update DB: Item found on shelf but marked out of stock." },
  { scene_id: "shelf_01", item: "USB Cable", event_type: "UNCERTAIN", confidence: 0.62, recommended_action: "Requires manual human review." }
];

export default function App() {
  const [inventory, setInventory] = useState([]);
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Available");

  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await fetch("https://op-pm-onboarding-technical-project.onrender.com/inventory");
      const data = await response.json();
      setInventory(data); 
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

  

   
    const newItem = {
      name: name,
      category: category,
      quantity: Number(quantity), 
      status: status
    };

    try {
      await fetch("http://localhost:3000/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      fetchInventory();

      setName("");
      setCategory("");
      setQuantity("");
      setStatus("Available");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 
    setChatResponse(""); 

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: chatQuery }),
      });
      
      const data = await response.json();
      setChatResponse(data.answer); 
    } catch (error) {
      console.error("Chat error:", error);
      setChatResponse("Sorry, there was an error connecting to the AI.");
    } finally {
      setIsLoading(false); 
      setChatQuery("");
    }
  };

  return (
    <>
      {/* MAIN INVENTORY & FORM SECTION */}
      <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "600px" }}>
        <h1>Open Project Inventory</h1>
        
        <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
          <h2>Add New Item</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input 
              placeholder="Name (e.g. Arduino Kit)" required
              value={name} onChange={(e) => setName(e.target.value)} 
            />
            <input 
              placeholder="Category (e.g. Hardware)" required
              value={category} onChange={(e) => setCategory(e.target.value)} 
            />
            <input 
              type="number" placeholder="Quantity" required
              value={quantity} onChange={(e) => setQuantity(e.target.value)} 
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            <button type="submit" style={{ padding: "10px", background: "blue", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Add to Inventory
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {inventory.map((item) => (
            <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
              <h2 style={{ margin: "0 0 10px 0" }}>{item.name}</h2>
              <p style={{ margin: "5px 0" }}><strong>Category:</strong> {item.category}</p>
              <p style={{ margin: "5px 0" }}><strong>Qty:</strong> {item.quantity}</p>
              <p style={{ margin: "5px 0", color: item.status === "Available" ? "green" : "red" }}>
                <strong>Status:</strong> {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM ALERTS SECTION */}
      <div style={{ marginTop: "40px", borderTop: "2px solid #ccc", paddingTop: "20px", maxWidth: "600px" }}>
        <h2>System Alerts & Discrepancies</h2>
        <p><em>Observed reality vs. Declared database truth</em></p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {auditLogs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                border: "1px solid", 
                borderColor: log.event_type === "DISCREPANCY" ? "red" : "orange",
                backgroundColor: log.event_type === "DISCREPANCY" ? "#ffe6e6" : "#fff5e6",
                padding: "15px", 
                borderRadius: "8px" 
              }}
            >
              <h3 style={{ margin: "0 0 5px 0", color: log.event_type === "DISCREPANCY" ? "darkred" : "darkorange" }}>
                [{log.event_type}] {log.item}
              </h3>
              <p style={{ margin: "2px 0" }}><strong>Location:</strong> {log.scene_id}</p>
              <p style={{ margin: "2px 0" }}><strong>ML Confidence:</strong> {(log.confidence * 100).toFixed(0)}%</p>
              <p style={{ margin: "5px 0" }}><strong>Action:</strong> {log.recommended_action}</p>
              
              {/* BUTTON FOR UNCERTAIN ITEM */}
              {log.event_type === "UNCERTAIN" && (
                <button style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer" }}>
                  Review Item
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI CHAT INTERFACE */}
      <div style={{ marginTop: "40px", borderTop: "2px solid #ccc", paddingTop: "20px", maxWidth: "600px", marginBottom: "40px" }}>
        <h2>Ask the Inventory AI</h2>
        <p><em>Use natural language to query the system</em></p>
        
        <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <input 
            style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            placeholder="e.g., Which hardware items are low stock?" 
            value={chatQuery} 
            onChange={(e) => setChatQuery(e.target.value)} 
            required
          />
          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ 
              padding: "10px 15px", 
              background: isLoading ? "#ccc" : "#0056b3", 
              color: "white", 
              border: "none", 
              borderRadius: "4px", 
              cursor: isLoading ? "not-allowed" : "pointer" 
            }}
          >
            {isLoading ? "Thinking..." : "Ask"}
          </button>
        </form>

        {chatResponse && (
          <div style={{ padding: "15px", backgroundColor: "#e6f2ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
            <strong>AI Assistant:</strong>
            <p style={{ margin: "10px 0 0 0", whiteSpace: "pre-wrap" }}>{chatResponse}</p>
          </div>
        )}
      </div>
    </>
  );
}