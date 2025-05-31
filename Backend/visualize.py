# visualize.py Iter 1
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

def generate_plot(csv_string, plot_type, x_col, y_col=None):
    df = pd.read_csv(io.StringIO(csv_string))

    fig, ax = plt.subplots(figsize=(6, 4))
    
    if plot_type == "bar":
        sns.barplot(data=df, x=x_col, y=y_col, ax=ax)
    elif plot_type == "line":
        sns.lineplot(data=df, x=x_col, y=y_col, ax=ax)
    elif plot_type == "scatter":
        sns.scatterplot(data=df, x=x_col, y=y_col, ax=ax)
    elif plot_type == "box":
        sns.boxplot(data=df, x=x_col, y=y_col, ax=ax)
    elif plot_type == "violin":
        sns.violinplot(data=df, x=x_col, y=y_col, ax=ax)
    elif plot_type == "hist":
        df[x_col].hist(ax=ax)
    elif plot_type == "kde":
        sns.kdeplot(data=df, x=x_col, ax=ax)
    elif plot_type == "pie":
          # Count occurrences of each category in x_col
        pie_data = df[x_col].value_counts()
        pie_data.plot.pie(ax=ax, autopct='%1.1f%%')
        ax.set_ylabel('')


    plt.tight_layout()

    # Convert to image
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64