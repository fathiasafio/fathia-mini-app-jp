Fathia
A decentralized application for recording your mood on the Base blockchain with World ID verification.

Features
Secure Authentication: Email-based user accounts with wallet connection
Human Verification: Integration with World ID to verify unique humans
On-chain Mood Recording: Store your moods permanently on the Base blockchain
Mood History: View your personal mood history over time
Global Mood Feed: See what moods others are experiencing around the world
Analytics Dashboard: Track usage metrics and mood trends
Tech Stack
Frontend: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
Blockchain: Ethers.js for interaction with Base blockchain
Authentication: Custom auth provider with wallet integration
Verification: World ID for human verification
Analytics: Recharts for data visualization
Getting Started
Prerequisites
Node.js 18+
Yarn or npm
MetaMask or another Ethereum wallet
Base network configured in your wallet
Small amount of ETH on Base for gas fees
Installation
```bash

Clone the repository
git clone https://github.com/yourusername/fathia.git

Navigate to the project directory
cd fathia

Install dependencies
npm install

Set up environment variables
cp .env.example .env.local

Edit .env.local with your values
Start the development server
npm run dev ```

Environment Variables
Create a .env.local file with the following variables:

``` NEXT_PUBLIC_WORLD_ID_APP_ID=app_... NEXT_PUBLIC_CONTRACT_ADDRESS=0x... ```

Usage
Create an Account: Sign up with email and password
Connect Wallet: Connect your Ethereum wallet (MetaMask recommended)
Verify Identity: Complete World ID verification
Set Your Mood: Choose from various mood options
View History: Check your mood history and global moods
Deployment
This application is deployed on Vercel. You can deploy your own instance by clicking the button below:

Deploy with Vercel

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Base blockchain for providing the infrastructure
World ID for the verification system
shadcn/ui for the component library
