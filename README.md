
### 📘 AI‑BookNest

An AI-powered platform to explore and interact with books—upload text or PDFs, ask questions, get summaries, and more.

#### Features

* 📚 **Book Upload** – Drop in your PDF or text file to start analyzing.
* 🧠 **Natural‑Language Q\&A** – Ask questions about the content and get AI-generated answers.
* 📝 **Chapter / Interval Summaries** – Automatically generate summaries for chapters or page ranges.
* 🔍 **Keyword Extraction** – Discover main themes and concepts within the text.
* 🗂️ **Knowledge Storage** – Save insights and revisit them anytime during your session.

#### Live Demo

Check it out here: [https://ai-powered-booknest.vercel.app/](https://ai-powered-booknest.vercel.app/)

#### Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/Hemali15f/AI-BookNest.git
   cd AI-BookNest
   ```

2. **Install dependencies**
   For example, using Node.js:

   ```bash
   npm install
   ```

3. **Configure environment**
   Set up `.env`:

   ```
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   The app will typically be available at `http://localhost:3000`.

#### Usage

* Upload your book file.
* Choose an AI model (e.g. GPT‑4, GPT‑3.5).
* Ask questions or generate summaries.
* Review the output in the interface.

#### Project Structure

```text
.
├── public/                # Static assets
├── src/
│   ├── components/        # UI components (UploadForm, QA, SummaryView)
│   ├── pages/             # Routes (index.tsx, api/)
│   └── utils/             # Helpers (OpenAI integration, file parsing)
├── .env.local             # API keys
├── package.json
└── README.md
```

#### Tech Stack

* Next.js (TypeScript)
* React + Tailwind CSS / Chakra UI
* Google Generative API for AI capabilities and Google Books API of books
* Vercel for deployment (as seen at the provided URL)

