from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def on_submit(doc, method = None):
	if doc.is_default_assembly:
		manage_default_assembly(doc)

def on_update_after_submit(doc, method = None):
	if doc.is_default_assembly:
		manage_default_assembly(doc)

def manage_default_assembly(doc):
	existed_default_assembly = frappe.db.sql("""SELECT distinct name from tabBOM 
		where is_default_assembly=1 and item_name='{0}' """.format(doc.item_name), as_dict=1)
	for i in existed_default_assembly:
		if i.name != doc.name:
			frappe.db.set_value("BOM", i.name,'is_default_assembly', 0 )
		else:
			frappe.db.set_value("BOM", i.name,'is_default_assembly', 1)