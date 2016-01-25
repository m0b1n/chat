for (var k = 0; k < z; k++)
{
    if (i1 < i)
    {
        if (sent[i1].date < rec[j1].date)
        {
            $('#messages').append($('<li  style="text-align:right;">').text('@history' + ' :' + sent[i1].message));
            i1++;
        }
    }
    if (j1 < j)
    {
        if (sent[i1].date > rec[j1].date)
        {
            $('#messages').append($('<li>').text('@history' + ' :' + rec[j1].message));
            j1++;
        }
    }
}