'use client';

import { useState } from 'react';

export default function Home() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [startRange, setStartRange] = useState('');
    const [endRange, setEndRange] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            origin,
            destination,
            startRange,
            endRange,
        };

        const response = await fetch('/api/commute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Best time to leave: ${result.bestDepartureTime} with a travel time of ${result.travelTimeInSeconds} seconds.`);
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Unable to determine the best departure time.'}`);
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f7f7f7', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>Commute Assistant</h1>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Origin:</label>
                <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'blue',
                    }}
                />
                <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Destination:</label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'blue',
                    }}
                />
                <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>Start Date and Time:</label>
                <input
                    type="datetime-local"
                    value={startRange}
                    onChange={(e) => setStartRange(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'blue',
                    }}
                />
                <label style={{ display: 'block', marginBottom: '8px', color: '#34495e' }}>End Date and Time:</label>
                <input
                    type="datetime-local"
                    value={endRange}
                    onChange={(e) => setEndRange(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        color: 'blue',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2ecc71',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                    }}
                >
                    Find Best Time
                </button>
            </form>
            {message && (
                <div
                    style={{
                        marginTop: '20px',
                        backgroundColor: '#dff0d8',
                        color: '#3c763d',
                        padding: '10px',
                        borderRadius: '4px',
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}
