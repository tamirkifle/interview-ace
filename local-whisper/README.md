# Local Whisper Transcription Service

This folder contains a Docker setup for running OpenAI Whisper locally for transcription.

## Quick Start

1. Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2. Start the Whisper service:
    ```bash
    docker-compose up -d
    ```

3. Wait for the model to download (first run only):
    ```bash
    docker-compose logs -f
    ```

4. Test the service:
    ```bash
    curl http://localhost:9002/
    ```

## Configuration
### Model Sizes
Edit `.env` to change the model size:

`tiny` - 39 MB, fastest, lowest accuracy

`base` - 74 MB, good balance (default)

`small` - 244 MB, better accuracy

`medium` - 769 MB, even better accuracy

`large` - 1550 MB, best accuracy, slowest


### Port Configuration
Default port is `9002`. Change in .env if needed:
```env
WHISPER_PORT=9002
```

### Using with StoryBank

1. Start this Whisper service
2. In StoryBank, go to Settings
3. Enable Transcription
4. Select "Local (Whisper)" as provider
5. Enter endpoint URL: http://host.docker.internal:9002

### Hardware Requirements

- Minimum: 2GB RAM (for tiny/base models)
- Recommended: 4GB RAM (for small/medium models)
- For large model: 8GB+ RAM

### Troubleshooting

#### Service not starting
```bash
docker-compose logs whisper
```

#### Out of memory
Use a smaller model in .env:
```env
WHISPER_MODEL=tiny
```

#### Port already in use
Change the port in .env:
```env
WHISPER_PORT=9003
```