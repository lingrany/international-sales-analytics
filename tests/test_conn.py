# test_conn.py
import pymysql

try:
    conn = pymysql.connect(
        host='13.55.157.193',
        port=887,
        user='test_honeywhale_',
        password='wTxAtJZ83hPbN448',
        database='test_honeywhale_',
        connect_timeout=5
    )
    print("✅ 连接成功！")
    with conn.cursor() as cur:
        cur.execute("SELECT VERSION()")
        print("MySQL 版本:", cur.fetchone()[0])
        cur.execute("SHOW TABLES")
        tables = [row[0] for row in cur.fetchall()]
        print("当前表:", tables)
except Exception as e:
    print("❌ 连接失败:", e)
finally:
    try:
        conn.close()
    except:
        pass