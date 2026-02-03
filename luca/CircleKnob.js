        /**
         * Knob Initialization
         */
        function setupKnob(containerId, arcId, pointerId, inputId, valId) {
            const container = document.getElementById(containerId);
            const arc = document.getElementById(arcId);
            const pointer = document.getElementById(pointerId);
            const input = document.getElementById(inputId);
            const valDisplay = document.getElementById(valId);
            
            const cx = 40; // SVG Center X | SVG 中心 X
            const cy = 40; // SVG Center Y | SVG 中心 Y
            const r = 30;  // Radius determining pointer and arc length | 旋钮半径，决定指针和圆弧的长度
            const circumference = 2 * Math.PI * r; // Full circle circumference | 计算完整的圆周长

            /**
             * update visual effects
             */
            function updateUI() {
                // 1. Get current percentage
                const val = parseFloat(input.value);
                const percent = (val - input.min) / (input.max - input.min);
                // console.log([input.min, input.max]);
                // console.log(["percent : ", percent]);

                // 2. Update arc length: 270 degrees is 75% of the circumference
                const drawLength = percent * (circumference * 0.75);
                arc.style.strokeDasharray = `${drawLength} ${circumference}`;
                
                // 3. Calculate pointer coordinates

                // Total knob travel is 270 degrees
                const angleInRad = (percent * 270) * Math.PI / 180;

                // In SVG, Y-axis points down. Clockwise is positive. 
                // inverse to standard Sin/Cos Cartesian coordinates.
                let xdelta = r * Math.cos(angleInRad);
                let ydelta = r * Math.sin(angleInRad);

                // Thresholding: very values → zero
                const epsilon = 1e-10; 
                if (Math.abs(xdelta) < epsilon) xdelta = 0;
                if (Math.abs(ydelta) < epsilon) ydelta = 0;

                // Calculate final end-point coordinates
                const x2 = cx + xdelta;
                // console.log(['x real change ', x2 - cx]);
                const y2 = cy + ydelta;
                // console.log(['y real change ', y2 - cy]);

                // Directly modify the end-point coordinates of the line element
                pointer.setAttribute('x2', x2);
                pointer.setAttribute('y2', y2);
                
                // 4. Update numerical display
                valDisplay.textContent = val;
                
                // Trigger input event
                input.dispatchEvent(new Event('input'));
            }

            /**
             * Mouse interaction logic
             */
            function handleInteraction(e) {
                const rect = container.getBoundingClientRect();
                // Calculate mouse offset relative to knob center
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Calculate click angle
                let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
                
                // Map angle to 0-360 range
                // align with 135deg start position (changed in css)
                let degrees = angle - 135; 
                while (degrees < 0) degrees += 360;

                // outside 270deg
                if (degrees > 270) {
                    degrees = (degrees > 315) ? 0 : 270;
                }

                // Map degrees back to value
                const percent = degrees / 270;
                const rawValue = percent * (input.max - input.min) + parseFloat(input.min);
                
                // Snap to defined step
                const step = parseFloat(input.step);
                const steppedValue = Math.round(rawValue / step) * step;
                
                // Clamp within bounds and update
                input.value = Math.min(Math.max(steppedValue, input.min), input.max);
                updateUI();
            }

            // Mouse event listeners
            let isDragging = false;
            container.addEventListener('mousedown', (e) => { isDragging = true; handleInteraction(e); });
            window.addEventListener('mousemove', (e) => { if (isDragging) handleInteraction(e); });
            window.addEventListener('mouseup', () => { 
                if (isDragging) {
                    isDragging = false;
                    input.dispatchEvent(new Event('change'));
                }
            });
            // Init
            updateUI();
        }

// Init
document.addEventListener('DOMContentLoaded', () => {
    setupKnob('mKnob', 'mArc', 'mPointer', 'mSlider', 'mVal');
    setupKnob('nKnob', 'nArc', 'nPointer', 'nSlider', 'nVal');
    setupKnob('loKnob', 'loArc', 'loPointer', 'loSlider', 'loVal');
    setupKnob('hoKnob', 'hoArc', 'hoPointer', 'hoSlider', 'hoVal');
    setupKnob('sKnob', 'sArc', 'sPointer', 'sSlider', 'sVal');
    setupKnob('gsKnob', 'gsArc', 'gsPointer', 'gsSlider', 'gsVal');
    setupKnob('vKnob', 'vArc', 'vPointer', 'vSlider', 'vVal');
    setupKnob('numKnob', 'numArc', 'numPointer', 'numSlider', 'numVal');
});