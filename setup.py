"""Setup script for Database Ontology Mapper."""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="database-ontology-mapper",
    version="1.0.0",
    author="Your Name",
    description="Discover and visualize database schemas from MySQL/MariaDB",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Database",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pymysql>=1.1.0",
        "sqlalchemy>=2.0.23",
        "pydantic>=2.5.0",
        "pydantic-settings>=2.1.0",
        "python-dotenv>=1.0.0",
        "fastapi>=0.104.1",
        "uvicorn>=0.24.0",
        "python-multipart>=0.0.6",
        "click>=8.1.7",
        "rich>=13.7.0",
        "colorlog>=6.8.0",
    ],
    entry_points={
        "console_scripts": [
            "ontology-mapper=src.main:cli",
        ],
    },
)

