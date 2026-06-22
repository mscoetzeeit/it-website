#!/usr/bin/env python
# Pull (question-stem : model-answer) blocks from a marking-guideline text dump.
# Targets stems that define a term, e.g. "Explain what X is:", "Define X:".
import sys, re

CUE = re.compile(r'\b(explain|define|describe|discuss|what is|what are|name the|give the term|state what|motivate)\b', re.I)

txt = open(sys.argv[1], encoding='utf-8').read()
lines = [l.rstrip() for l in txt.split('\n')]

i = 0
blocks = []
while i < len(lines):
    l = lines[i].strip()
    # stem: contains a question number, a defining cue, ends with ':'
    if CUE.search(l) and l.endswith(':') and re.search(r'\d\.\d', l):
        ans = []
        j = i + 1
        while j < len(lines) and j < i + 12:
            a = lines[j].strip()
            if re.search(r'\(\d+\)\s*$', a) or re.match(r'^[•\-]?\s*\d+\.\d', a):
                if a and not re.match(r'^[•\-]?\s*\d+\.\d', a):
                    ans.append(a)
                break
            if a:
                ans.append(a)
            j += 1
        blocks.append((l, ' '.join(ans)))
        i = j
    else:
        i += 1

for stem, ans in blocks:
    print('STEM:', stem)
    print('ANS :', ans[:400])
    print('-' * 60)
