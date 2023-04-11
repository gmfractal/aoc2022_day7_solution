# Solutions to the Advent of Code Day 7 problems (parts 1 and 2)

Link to the original problem statement: https://adventofcode.com/2022/day/7

The problem requires creating a way to model the directories and files in a file system, parsing the instructions in the problem to construct the file system and then solving the problems which require evaluating the sizes of the directories and files in the system.

This JavaScript solution uses classes to model the directories and files of a file system as nodes. Each node contains a reference back to its parent so that when a change is made in the file system, that change can be easily propagated upwards to update all predecesor nodes until the root node is reached.
