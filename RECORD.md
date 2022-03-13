# DIRECTION

## 2022-03-13

Alright, now that I have a decent

## 2021-11-12

### Results

Today I refactored the example from Foxglove to be a class. I also exposed
preview time and the `allFrames` property, which gives me access to all of the
messages in a bag. Next, I'll be working on using the `allFrames` property to
scrub to arbitrary locations in the bag. This will require having two pipelines
for updates:

1. A pipeline that updates nodes as messages come in.
2. A pipeline that gets all messages between the start and a current play time
   and uses that to build an idea of what nodes are around. After this is built,
   when the user is playing the bag file, we can go back to method one. For
   efficiency, it might actually be good to take the difference between the
   current play time and the preview time so that I can remove messages that
   occurred in the time, rather than going from zero.

## 2021-11-13

Today I am going to try to use the `allFrames` property to scrub to arbitrary
time in the bag. This will require moving some of the logic in the node viewer
into the example panel class. It makes sense to put it there, as it is really
where the state should be.

### Results

I got scrubbing working! One thing that I notice is that if the bag loops or I
restart the bag, the system's state keeps going and thus it is not correct. I
can fix this by scrubbing again, but this is not desirable. I should probably
ask the Foxglove guys how to solve this.
