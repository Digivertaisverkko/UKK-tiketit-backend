#!/bin/bash

sudo -u postgres psql -d "dvvukk" -f ./docs/postgres/dvvukk_drop_tables.txt 

sudo -u postgres psql -d "dvvukk" -f ./docs/postgres/dvvukk_create_tables.txt

sudo -u postgres psql -d "dvvukk" -f ./docs/postgres/dvvukk_sample_data.txt