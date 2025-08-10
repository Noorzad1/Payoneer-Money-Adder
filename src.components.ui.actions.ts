'use server';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function addMoney(params: {
    email: string,
    amount: string,
    ipVanish: boolean,
    torGuard: boolean
}) {
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const enqueue = (text: string) => controller.enqueue(encoder.encode(text + '\n'));
            
            const apiKey = process.env.PAYONEER_API_KEY;

            enqueue("Initiating transaction...");
            await sleep(500);
            
            if (apiKey) {
                enqueue("Payoneer API key found.");
                await sleep(500);
                
                // --- Placeholder API Logic ---
                // This is where you would make the actual API call to Payoneer.
                // The following is a placeholder to show how you might do it.
                enqueue("Contacting Payoneer API...");
                try {
                    const response = await fetch('https://api.payoneer.com/v4/placeholder/payments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            recipient: params.email,
                            amount: params.amount,
                            currency: 'USD',
                        }),
                    });

                    // You would handle the real response here.
                    // For now, we'll just check if the mock request was successful.
                    if (response.ok || response.status === 404) { // 404 because the URL is fake
                        enqueue("API request sent (simulated).");
                    } else {
                        enqueue(`API request failed with status: ${response.status}`);
                    }
                } catch (error) {
                    enqueue("Failed to connect to Payoneer API (simulated).");
                }
                await sleep(1000);
                // --- End Placeholder API Logic ---

            } else {
                enqueue("Payoneer API key not found. Running in simulation mode.");
                await sleep(500);
            }

            if (params.ipVanish) {
                enqueue("Activating IP Vanish... secure connection established.");
                await sleep(700);
            }
            if (params.torGuard) {
                enqueue("Routing through Tor Guard... network anonymized.");
                await sleep(700);
            }

            enqueue(`Validating recipient: ${params.email}...`);
            await sleep(500);
            enqueue("Recipient validated.");
            await sleep(300);

            enqueue(`Preparing to send $${params.amount}...`);
            await sleep(500);

            enqueue("Contacting bank... authorized.");
            await sleep(1000);

            enqueue("Executing transfer...");
            await sleep(1500);

            enqueue("Transfer successful. Confirmation sent to your email.");
            await sleep(300);
            
            controller.close();
        }
    });

    return stream;
}

export async function checkStatus(params: {
    ipVanish: boolean,
    torGuard: boolean
}) {
    await sleep(500); // Simulate network latency
    const status = {
        api: "OK",
        database: "OK",
        ledger: "OK",
        security: "OK",
        ipVanish: "Active",
        torGuard: "Active"
    };

    return status;
}
