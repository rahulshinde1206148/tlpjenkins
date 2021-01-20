# -*- coding: utf-8 -*-
# Copyright (c) 2021, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CostSheet(Document):
    def validate(self):
        set_basic_rate_cost_rate_and_total_weight(self) 
       
    def before_save(self):
        delete_records()
        
def delete_records():
    frappe.db.sql("""delete from `tabMaterial Cost Item`""")

def set_basic_rate_cost_rate_and_total_weight(doc):
    if doc.cost_working_items:
        total_basic, total_cost = 0.0, 0.0;
        for i in doc.cost_working_items:
            if i.basic_rate != 0:
                try:
                    if i.basic_rate != '':
                        flt_basic_rate= float(i.basic_rate)
                except Exception as e:
                    pass
                total_basic += flt_basic_rate
            if i.cost_rate:
                try:
                    if i.cost_rate != '':
                        flt_cost_rate= float(i.cost_rate)
                except Exception as e:
                    pass
                total_cost += flt_cost_rate
    if doc.costsheet_items :
        for i in doc.costsheet_items:
            i.basic_rate = total_basic
            i.cost_rate = total_cost
            i.total_weight = get_total_weight(doc)
            i.amount_of_percent_1 = get_amount_of_percent(i.percent_1, i.cost_rate) 
            i.amount_of_percent_2 = get_amount_of_percent(i.percent_2, i.cost_rate)
            i.amount_of_percent_3 =get_amount_of_percent(i.percent_3, i.cost_rate)

def get_total_weight(doc):
    total_weight = 0.0
    if doc.assembly:
        bom = frappe.get_doc("BOM", doc.assembly)
        for i in bom.items:
            total_weight += (i.finished_weight * i.qty)
        return total_weight

def get_amount_of_percent(percent, cost_rate):
    try:
        if cost_rate != '':
            flt_cost_rate = float(cost_rate)
    except Exception as e:
        pass
    return ((flt_cost_rate * percent)/100)+flt_cost_rate

   
   
   
