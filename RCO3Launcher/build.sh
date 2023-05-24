#!/bin/bash

set -x
set -e

# Install Rustup
curl https://sh.rustup.rs | sh -s -- --no-modify-path -y

# Add Rust to PATH
source $HOME/.cargo/env

# Install target platforms
rustup target add x86_64-unknown-linux-gnu x86_64-pc-windows-msvc # x86_64-apple-darwin aarch64-apple-darwin aarch64-unknown-linux-gnu

# Build for each platform
cargo build --release --target=x86_64-unknown-linux-gnu
if [ $? -ne 0 ]; then
    echo "Build failed for x86_64-unknown-linux-gnu"
    exit 1
fi
# cargo build --release --target=aarch64-unknown-linux-gnu
# if [ $? -ne 0 ]; then
#     echo "Build failed for aarch64-unknown-linux-gnu"
#     exit 1
# fi
# cargo build --release --target=x86_64-apple-darwin
# if [ $? -ne 0 ]; then
#     echo "Build failed for x86_64-apple-darwin"
#     exit 1
# fi
# cargo build --release --target=aarch64-apple-darwin
# if [ $? -ne 0 ]; then
#     echo "Build failed for aarch64-apple-darwin"
#     exit 1
# fi
cargo build --release --target=x86_64-pc-windows-msvc
if [ $? -ne 0 ]; then
    echo "Build failed for x86_64-pc-windows-msvc"
    exit 1
fi
