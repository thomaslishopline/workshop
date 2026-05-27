# Performance Test Instructions

## Purpose
Validate that trap system calculations do not degrade frame rate below 60fps.

## Performance Requirements
- **Frame Rate**: Maintain 60fps (16.67ms frame budget)
- **Trap Calculation Budget**: < 2ms per frame for all trap processing
- **Memory**: No memory leaks from trap state accumulation

## Manual Performance Testing

### 1. Browser DevTools Profiling
```
1. Open game in Chrome/Firefox
2. Open DevTools → Performance tab
3. Start recording
4. Play through 2-3 full sequence cycles (20-30 pipes)
5. Stop recording
6. Analyze frame timing:
   - Check for frames exceeding 16.67ms
   - Look for GC pauses
   - Verify trap update() calls are < 2ms
```

### 2. Frame Rate Monitoring
```
1. Open game in browser
2. Open DevTools → Console
3. Monitor requestAnimationFrame timing
4. Play through multiple cycles
5. Verify consistent 60fps
```

### 3. Memory Leak Check
```
1. Open game in Chrome
2. Open DevTools → Memory tab
3. Take heap snapshot
4. Play 5+ full cycles (50+ pipes)
5. Take another heap snapshot
6. Compare: verify no growing allocations from trap objects
7. Key check: pipe array should not grow unbounded (off-screen pipes are removed)
```

## Expected Results
- **Frame Rate**: Consistent 60fps during gameplay with all trap types active
- **Trap Processing**: < 1ms typical (only 2-3 active pipes at any time)
- **Memory**: Stable — pipes removed when off-screen, trapState garbage collected with pipe

## Performance Characteristics
- Trap processing is O(n) where n = active pipes on screen (typically 2-3)
- No complex calculations — simple arithmetic and comparisons
- No allocations in hot path (TrapEffect objects are lightweight)
- Deterministic sequence lookup is O(1)

## If Performance Issues Found
1. Profile to identify bottleneck (unlikely given O(n) with n≈3)
2. Check for accidental pipe accumulation (filter not removing off-screen pipes)
3. Verify no infinite loops in oscillation calculation
4. Check for excessive object creation in update loop
