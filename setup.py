# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in tlp_app/__init__.py
from tlp_app import __version__ as version

setup(
	name='tlp_app',
	version=version,
	description='Transmission Line Products',
	author='Indictrans',
	author_email='anuradha.k@indictranstech.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
