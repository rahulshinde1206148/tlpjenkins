# -*- coding: utf-8 -*-
# Copyright (c) 2021, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document

class CostSheet(Document):
    def validate(self):
        print(">>>>>>>>>>>>>>>>>>>>>>>>>>.validate")
        get_basic_rate(self)

def get_basic_rate(doc):
    if(doc.cost_working_items):
        total_basic = 0.0 ;
        for i in doc.cost_working_items:
            if i.basic_rate:
                total_basic += i.basic_rate
    if(doc.cost_sheet_items):
        for i in doc.cost_sheet_items:
            i.basic_rate = total_basic

def set_blank_values_on_cost_working(doc):
     if(doc.cost_working_items):
        total_basic = 0.0 ;
        for i in doc.cost_working_items:
            if i.basic_rate == 0:
                i.basic_rate = ''
                