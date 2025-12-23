# Data Quality Report Notebook

## Overview

The `data_quality_report.ipynb` notebook provides comprehensive data quality analysis for the Dashdoor SQLite database. It follows industry best practices for data quality assessment and includes all sections recommended for synthetic database validation.

## Features

✅ **Complete Coverage**: All 11 sections from the data quality guide  
✅ **Visualizations**: Charts and heatmaps for data insights  
✅ **Automated Checks**: Foreign key integrity, missing values, consistency  
✅ **Domain-Specific**: Dashdoor-specific business logic validation  
✅ **LLM Framework**: Ready-to-use framework for semantic validation  
✅ **Quality Scoring**: Automated data quality score calculation  

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Ensure the database file exists:
   - `dashdoor_600_latest-fixed.db` (or update `SQL_INPUT` in the notebook)

## Usage

1. **Open the notebook:**
```bash
jupyter notebook data_quality_report.ipynb
```

Or use JupyterLab:
```bash
jupyter lab data_quality_report.ipynb
```

2. **Run all cells:**
   - Use "Run All" from the Cell menu
   - Or run cells sequentially (Shift+Enter)

3. **Review the output:**
   - Each section produces tables, charts, and summaries
   - Final section provides overall data quality score

## Notebook Sections

### 1. Setup & Environment
- Python version check
- Library imports
- Database file validation

### 2. Load SQL DB
- Connect to SQLite database
- List all tables with row counts

### 3. Database-Level Summary
- Total tables, rows, columns
- Column type breakdown
- Estimated database size

### 4. Table-Level Profiling
- Column metadata (type, missing %, unique values)
- Example values for each column
- Sample data preview

### 5. Categorical Distributions
- Top categories for categorical columns
- Entropy scores (distribution diversity)
- Long-tail analysis
- Single-occurrence detection

### 6. Schema-Specific Insights
- **6.1 Restaurants**: Price range, cuisine distribution
- **6.2 Menu Items**: Price statistics, menu size per restaurant
- **6.3 Orders**: Total consistency, timestamp validation

### 7. Missing Value Analysis
- Missing value heatmap
- High missingness alerts (>40%)
- Column-by-column missing analysis

### 8. Foreign Key Integrity Validation
- Checks 16+ foreign key relationships
- Orphan key detection
- Example problematic rows

### 9. Cross-Table Semantic Consistency
- **9.1**: Order subtotal vs item sum consistency
- **9.2**: Restaurant cuisine-category alignment
- **9.3**: Free delivery validation

### 10. Semantic Validation with LLMs
- Framework for LLM-based validation
- Suspicious data identification
- Ready for OpenAI API integration

### 11. Summary of Findings
- Major issues list
- Minor warnings
- Data quality scores (0-100)
- Recommendations

## Configuration

### Change Database File
Edit the `SQL_INPUT` variable in the first code cell:
```python
SQL_INPUT = "your_database.db"
```

### Adjust Analysis Parameters
- Sample sizes: Modify `sample_size` in `profile_table()` function
- Missing threshold: Change `> 40` in high missingness check
- Top N values: Adjust `top_n` in categorical analysis

### Enable LLM Validation
1. Uncomment the LLM code section
2. Add your OpenAI API key:
```python
import openai
openai.api_key = "your-api-key-here"
```

## Output Examples

The notebook generates:
- **Tables**: Pandas DataFrames with detailed statistics
- **Charts**: Matplotlib/Seaborn visualizations
- **Heatmaps**: Missing value patterns
- **Scores**: Data quality metrics (0-100)

## Data Quality Score Components

1. **Completeness** (0-100): Based on missing value percentage
2. **Referential Integrity** (0-100): Based on foreign key violations
3. **Consistency** (0-100): Based on order calculation mismatches
4. **Overall Score**: Average of the three components

## Troubleshooting

### Database Not Found
- Ensure `dashdoor_600_latest-fixed.db` is in the same directory as the notebook
- Or update `SQL_INPUT` path

### Missing Libraries
```bash
pip install pandas matplotlib seaborn numpy jupyter
```

### Display Issues
- Use `display()` instead of `print()` for DataFrames in Jupyter
- Ensure matplotlib backend is set correctly

## Next Steps

After running the notebook:
1. Review the Summary of Findings section
2. Address critical issues (P0 priority)
3. Fix medium-priority data quality issues
4. Re-run notebook to verify fixes
5. Set up automated runs for continuous monitoring

## Notes

- The notebook processes up to 10,000 rows per table for performance
- LLM validation requires API key configuration
- Some analyses may take a few minutes for large tables
- Results are cached in memory between cells

---

**Created for:** Dashdoor Database Automation  
**Database:** dashdoor_600_latest-fixed.db  
**Last Updated:** 2024

