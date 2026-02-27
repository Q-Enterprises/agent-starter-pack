#!/usr/bin/env python3
"""Upload an MP4 to YouTube using OAuth credentials."""

from __future__ import annotations

import argparse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Upload rendered MP4 to YouTube")
    parser.add_argument("--video", required=True, type=Path, help="Path to MP4 file")
    parser.add_argument("--title", default="99 Balloon Token Map for Agent Training")
    parser.add_argument("--description", default="Embedding tensor slices mapped to balloon semantics.")
    parser.add_argument("--tags", nargs="*", default=["ai", "agents", "embedding", "education"])
    parser.add_argument("--category-id", default="28", help="YouTube category (28=Science & Technology)")
    parser.add_argument("--privacy-status", choices=["private", "unlisted", "public"], default="unlisted")
    parser.add_argument("--client-secrets", required=True, type=Path, help="Path to client secrets JSON file")
    parser.add_argument("--token-file", default="youtube_token.json", type=Path)
    return parser.parse_args()


def upload_video(args: argparse.Namespace) -> str:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    scopes = ["https://www.googleapis.com/auth/youtube.upload"]
    creds = None

    if args.token_file.exists():
        creds = Credentials.from_authorized_user_file(str(args.token_file), scopes)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(args.client_secrets), scopes)
            creds = flow.run_local_server(port=0)
        args.token_file.write_text(creds.to_json(), encoding="utf-8")

    youtube = build("youtube", "v3", credentials=creds)

    body = {
        "snippet": {
            "title": args.title,
            "description": args.description,
            "tags": args.tags,
            "categoryId": args.category_id,
        },
        "status": {"privacyStatus": args.privacy_status},
    }

    media = MediaFileUpload(str(args.video), chunksize=1024*1024, resumable=True, mimetype="video/mp4")
    req = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        _, response = req.next_chunk()

    return response["id"]


def main() -> None:
    args = parse_args()
    if not args.video.exists():
        raise FileNotFoundError(f"Video file not found: {args.video}")

    video_id = upload_video(args)
    print(f"Uploaded successfully. video_id={video_id}")
    print(f"https://www.youtube.com/watch?v={video_id}")


if __name__ == "__main__":
    main()
