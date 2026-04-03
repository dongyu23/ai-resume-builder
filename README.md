# AI Resume Builder

An intelligent, cloud-native LaTeX resume builder designed for software engineers and PMs. It allows users to write their resume in standard LaTeX, preview the rendered PDF in real-time, and seamlessly optimize the content against specific Job Descriptions (JD) using LLMs.

## 🌟 Key Features

- **In-Browser LaTeX Editor**: Powered by Monaco Editor, providing syntax highlighting and a smooth writing experience.
- **Real-Time PDF Compilation**: Uses `Tectonic` as the backend engine to securely and quickly compile `.tex` files into PDF. No local TeX Live installation is required.
- **Flawless Chinese Font Support**: Pre-configured to support standard CJK fonts (`Fandol`) and `xeCJK` out of the box, eliminating the notorious `nullfont` errors in cloud environments.
- **AI JD Alignment (The PM Flow)**: 
  - Paste a Job Description and let the AI (e.g., DeepSeek-V3.2, GLM-4) analyze your resume.
  - Generates a side-by-side diff explanation.
  - **Non-Destructive Apply**: Instead of overwriting your original resume, it creates a new tailored variant (`main_tailored_<timestamp>.tex`) so you can manage multiple versions for different companies.
- **Production-Ready Timeout Handling**: Configured to handle slow-streaming LLMs with robust 3-minute timeouts across the entire stack (Axios -> Vite Proxy -> FastAPI -> OpenAI Client).

## 🏗 Architecture

- **Frontend**: React 18, Vite, TailwindCSS v4, Monaco Editor, Lucide Icons.
- **Backend**: FastAPI (Python 3.14), Uvicorn.
- **LaTeX Engine**: Tectonic (Rust-based modern TeX engine).
- **AI Integration**: OpenAI-compatible API wrapper (`openai` python package) connecting to external LLM providers (e.g., Paratera, DeepSeek, GLM).

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Tectonic (installed globally or binary placed in `/workspace/bin/tectonic`)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your environment variables:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   export OPENAI_BASE_URL="https://your-llm-provider.com/v1"
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000` (or `3001`).

## 🧪 E2E Testing

This project includes automated End-to-End testing scripts written using Playwright to verify the AI optimization flow.

1. Install Playwright:
   ```bash
   pip install playwright requests
   playwright install chromium
   ```
2. Run the test script:
   ```bash
   python test_jd_optimizer.py
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the MIT License.