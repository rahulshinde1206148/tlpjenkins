from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def autoname(doc, method=None):
	update_naming_series(doc)

def on_submit(doc, method = None):
	if doc.is_assembly:
		manage_assembly(doc)

def on_update_after_submit(doc, method = None):
	if doc.is_assembly:
		manage_assembly(doc)

def manage_assembly(doc):
	existed_assembly = frappe.db.sql("""SELECT distinct name from tabBOM 
		where is_assembly and item_name='{0}' """.format(doc.item_name), as_dict=1)
	for i in existed_assembly:
		if i.name != doc.name:
			frappe.db.set_value("BOM", i.name,'is_assembly', 0 )
		else:
			frappe.db.set_value("BOM", i.name,'is_assembly', 1)

def update_naming_series(doc):
	naming_series = doc.naming_series+doc.item+'-'
	current_count = frappe.db.sql("""select MAX(current) AS current from `tabSeries` where name = '{0}'""".format(naming_series),as_dict=1)
	current = current_count[0].get('current')	
	if current is None:
		current = 1
		series = str(current)
		doc_name = naming_series + series.zfill(5)
		frappe.db.sql("insert into tabSeries (name, current) values (%s, 1)", (naming_series))
		doc.name = doc_name
	else:
		current = current + 1
		series = str(current)
		new_name = naming_series + series.zfill(5)
		frappe.db.sql("""update tabSeries set current = {0} where name = '{1}'""".format(current, naming_series))
		doc.name = new_name