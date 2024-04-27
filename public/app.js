
function appendNumber(number) {
    document.getElementById('display').value += number;
}
function calculate() {
    let display = document.getElementById('display');
    try {
        display.value = eval(display.value);
    } catch(e) {
        display.value = 'Error';
    }
}
function clearDisplay() {
    document.getElementById('display').value = '';
}
