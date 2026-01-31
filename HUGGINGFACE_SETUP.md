# Setting Up Hugging Face API

This project now uses Hugging Face's Inference API for fake news detection.

## Getting Your Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/) and create an account (if you don't have one)
2. Navigate to your [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Give it a name (e.g., "fake-news-detector")
5. Select "Read" permissions (sufficient for inference)
6. Click "Generate token"
7. Copy the token (starts with `hf_...`)

## Configuration

1. Open the `.env` file in the root directory
2. Replace `your_huggingface_api_key_here` with your actual token:
   ```
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
3. Save the file

## Model Used

The project uses the `hamzab/roberta-fake-news-classification` model from Hugging Face, which is specifically fine-tuned for detecting fake news.

Alternative models you can try (just change the `HF_MODEL` constant in `server/routes.ts`):
- `mrm8488/bert-tiny-finetuned-fake-news-detection`
- `elozano/bert-base-cased-fake-news`
- `GonzaloA/fake_news_detector`

## Starting the Development Server

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5000`

## Notes

- The Hugging Face Inference API has a free tier with rate limits
- First request might be slower (model cold start)
- For production, consider using a paid plan or hosting your own model
