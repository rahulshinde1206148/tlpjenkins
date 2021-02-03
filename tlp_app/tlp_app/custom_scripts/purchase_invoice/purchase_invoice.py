from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

def validate(doc, method = None):
	if len(doc.taxes) == 0 :
		for i in doc.items:
			if i.amount:
				i.item_cost = i.amount
	else:
		if doc.total_taxes_and_charges :
			for i in doc.items:
				i.item_cost = i.amount + (doc.total_taxes_and_charges * i.qty)/doc.total_qty

		
		