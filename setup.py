from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="embroider-size",
    version="0.1.0",
    author="EmbroiderSize Contributors",
    description="A tool to properly resize embroidery stitch files without ruining the stitches",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/JimmiFriborg/EmbroiderSize",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Artistic Software",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pyembroidery>=1.4.0",
        "click>=8.0.0",
        "rich>=13.0.0",
    ],
    entry_points={
        "console_scripts": [
            "embroider-resize=src.cli:cli",
        ],
    },
)
